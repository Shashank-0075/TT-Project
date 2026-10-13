package com.campusfix.service;

import com.campusfix.exception.InvalidFileException;
import com.campusfix.exception.ResourceNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores uploaded images on the local disk (folder "uploads/" next to the backend).
 * Only the relative path (e.g. "complaints/6f1c...e2.png") is saved in MySQL.
 *
 * Why not store images inside the database? Big binary data makes the database slow and
 * hard to back up. Files on disk are simple and fast - perfect for a college project.
 *
 * Security measures:
 *  - only JPEG, PNG, GIF and WEBP are accepted
 *  - the real file content is checked ("magic bytes"), not only the file name
 *  - maximum size 5 MB
 *  - the file is saved under a random UUID name, the user supplied name is never used
 *    (prevents path traversal such as "../../something")
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    public static final String COMPLAINT_FOLDER = "complaints";
    public static final String RESOLUTION_FOLDER = "resolutions";
    private static final Set<String> ALLOWED_FOLDERS = Set.of(COMPLAINT_FOLDER, RESOLUTION_FOLDER);

    private final Path root;
    private final long maxFileSizeBytes;

    public FileStorageService(@Value("${campusfix.upload.dir}") String uploadDir,
                              @Value("${campusfix.upload.max-file-size-bytes}") long maxFileSizeBytes) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    /**
     * Validates and saves the image.
     *
     * @param folder COMPLAINT_FOLDER or RESOLUTION_FOLDER
     * @return the relative path to store in the database
     */
    public String storeImage(MultipartFile file, String folder) {
        if (!ALLOWED_FOLDERS.contains(folder)) {
            throw new IllegalArgumentException("Unknown upload folder: " + folder);
        }
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("The uploaded file is empty.");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new InvalidFileException("The image is too large. Maximum allowed size is "
                    + (maxFileSizeBytes / (1024 * 1024)) + " MB.");
        }

        String extension = detectExtension(file);

        String fileName = UUID.randomUUID() + "." + extension;
        Path targetDirectory = root.resolve(folder);
        Path target = targetDirectory.resolve(fileName).normalize();
        if (!target.startsWith(root)) {
            throw new InvalidFileException("Invalid file path.");
        }

        try {
            Files.createDirectories(targetDirectory);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            log.error("Could not store file {}", target, ex);
            throw new InvalidFileException("The file could not be saved. Please try again.");
        }
        return folder + "/" + fileName;
    }

    /** Looks at the first bytes of the file to find out what it REALLY is. Returns jpg/png/gif/webp. */
    private String detectExtension(MultipartFile file) {
        byte[] header = new byte[12];
        int read;
        try (InputStream in = file.getInputStream()) {
            read = in.readNBytes(header, 0, header.length);
        } catch (IOException ex) {
            throw new InvalidFileException("The uploaded file could not be read.");
        }

        String detected = null;
        if (read >= 3 && (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
            detected = "jpg";
        } else if (read >= 8 && (header[0] & 0xFF) == 0x89 && header[1] == 'P' && header[2] == 'N'
                && header[3] == 'G' && header[4] == 0x0D && header[5] == 0x0A
                && header[6] == 0x1A && header[7] == 0x0A) {
            detected = "png";
        } else if (read >= 6 && header[0] == 'G' && header[1] == 'I' && header[2] == 'F' && header[3] == '8'
                && (header[4] == '7' || header[4] == '9') && header[5] == 'a') {
            detected = "gif";
        } else if (read >= 12 && header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P') {
            detected = "webp";
        }

        if (detected == null) {
            throw new InvalidFileException("Invalid file. Only JPG, PNG, GIF or WEBP images are allowed.");
        }

        // The file name extension must also be an allowed image type.
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        boolean extensionOk = Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp")
                .stream().anyMatch(originalName::endsWith);
        if (!extensionOk) {
            throw new InvalidFileException("Invalid file name. Allowed extensions: jpg, jpeg, png, gif, webp.");
        }
        return detected;
    }

    /** Loads a stored file. The path is checked so that nobody can read files outside "uploads/". */
    public Resource load(String relativePath) {
        try {
            Path file = root.resolve(relativePath).normalize();
            if (!file.startsWith(root) || !Files.isRegularFile(file)) {
                throw new ResourceNotFoundException("File not found");
            }
            return new UrlResource(file.toUri());
        } catch (IOException ex) {
            throw new ResourceNotFoundException("File not found");
        }
    }

    /** Removes a file; used to clean up when saving to the database fails. Never throws. */
    public void deleteQuietly(String relativePath) {
        if (relativePath == null) {
            return;
        }
        try {
            Path file = root.resolve(relativePath).normalize();
            if (file.startsWith(root)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException ex) {
            log.warn("Could not delete file {}", relativePath);
        }
    }

    /** Content type for the HTTP response, derived from our own (trusted) extension. */
    public MediaType mediaTypeFor(String relativePath) {
        String lower = relativePath.toLowerCase();
        if (lower.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }
        if (lower.endsWith(".gif")) {
            return MediaType.IMAGE_GIF;
        }
        if (lower.endsWith(".webp")) {
            return MediaType.parseMediaType("image/webp");
        }
        return MediaType.IMAGE_JPEG;
    }
}
