package com.campusfix.dto;

/** One point of a chart: a label (e.g. "Electrical") and a value (e.g. 12). */
public record ChartPoint(String label, long value) {
}
