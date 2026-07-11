// boundary: 'start' -> minuit UTC du jour, 'end' -> 23:59:59.999 UTC du jour
export function parseISODateUTC(value, boundary) {
  if (!value) return null;
  const time = boundary === "end" ? "23:59:59.999" : "00:00:00.000";
  const date = new Date(`${value}T${time}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseQueryRange(req, res) {
  const { start, end } = req.query;
  if (!start || !end) {
    res.status(400).json({ error: "start and end query params are required (YYYY-MM-DD)" });
    return null;
  }
  const startDate = parseISODateUTC(start, "start");
  const endDate = parseISODateUTC(end, "end");
  if (!startDate || !endDate) {
    res.status(400).json({ error: "Invalid start or end date" });
    return null;
  }
  return { startDate, endDate };
}

// Chevauchement d'intervalle : le document est retourné dès que sa période
// [periodStart, periodEnd] chevauche au moins partiellement [queryStart, queryEnd].
export function overlapFilter(userId, startDate, endDate) {
  return {
    userId,
    periodStart: { $lte: endDate },
    periodEnd: { $gte: startDate },
  };
}
