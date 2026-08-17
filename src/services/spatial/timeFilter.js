// ============================================================
// VanDrishti AI — Time-Independence & Activity Filter
// ============================================================
// Eliminates burst detections and autocorrelation at camera traps
// to ensure statistically independent samples for ecological
// home-range estimation.
// ============================================================

/**
 * Filter camera trap detections to ensure temporal independence.
 * Consecutive detections of the same individual at the same camera
 * within `minMinutes` are pruned to avoid pseudo-replication.
 *
 * @param {Array<Object>} detections Raw detection records
 * @param {number} [minMinutes=30] Minimum independence threshold in minutes
 * @returns {Array<Object>} Filtered independent detections with enriched temporal metadata
 */
export function prepareDetections(detections, minMinutes = 30) {
  if (!detections || !Array.isArray(detections)) return [];

  const sorted = [...detections].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const accepted = [];
  const lastAcceptedByCamera = new Map();

  for (const detection of sorted) {
    const currentTime = new Date(detection.timestamp);
    const lastTime = lastAcceptedByCamera.get(detection.camera_id || detection.cameraId);

    if (lastTime) {
      const differenceMinutes = (currentTime.getTime() - lastTime.getTime()) / (1000 * 60);
      if (differenceMinutes < minMinutes) {
        continue;
      }
    }

    const hour = currentTime.getHours();
    const isNight = hour >= 18 || hour < 6;

    accepted.push({
      ...detection,
      camera_id: detection.camera_id || detection.cameraId,
      date: currentTime.toISOString().split("T")[0],
      hour,
      month: currentTime.getMonth() + 1,
      isNight,
      timeString: currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    lastAcceptedByCamera.set(detection.camera_id || detection.cameraId, currentTime);
  }

  return accepted;
}

/**
 * Compute temporal summary statistics for an animal's independent sightings.
 * @param {Array<Object>} independentDetections
 * @param {number} totalRawCount
 * @returns {Object} Activity summary metrics
 */
export function calculateActivityProfile(independentDetections, totalRawCount = 0) {
  const total = independentDetections.length;
  if (total === 0) {
    return {
      totalIndependent: 0,
      totalRaw: totalRawCount,
      filterRate: 0,
      nightPercent: 0,
      dayPercent: 0,
      hourlyDistribution: new Array(24).fill(0),
      peakActivityHour: null,
    };
  }

  let nightCount = 0;
  const hourly = new Array(24).fill(0);

  for (const d of independentDetections) {
    if (d.isNight) nightCount++;
    if (d.hour >= 0 && d.hour < 24) {
      hourly[d.hour]++;
    }
  }

  let maxHourVal = -1;
  let peakHour = 0;
  hourly.forEach((count, h) => {
    if (count > maxHourVal) {
      maxHourVal = count;
      peakHour = h;
    }
  });

  const filterRate = totalRawCount > 0 
    ? Math.round(((totalRawCount - total) / totalRawCount) * 100)
    : 0;

  return {
    totalIndependent: total,
    totalRaw: totalRawCount || total,
    filterRate,
    nightCount,
    dayCount: total - nightCount,
    nightPercent: Math.round((nightCount / total) * 100),
    dayPercent: Math.round(((total - nightCount) / total) * 100),
    hourlyDistribution: hourly,
    peakActivityHour: `${String(peakHour).padStart(2, "0")}:00 - ${String((peakHour + 1) % 24).padStart(2, "0")}:00`,
  };
}
