function cleanName(name) {
  if (typeof name !== "string") {
    return "";
  }

  // Remove spaces at the start and end
  let trimmed = name.trim();

  // Replace multiple spaces with a single space
  while (trimmed.includes("  ")) {
    trimmed = trimmed.replace("  ", " ");
  }

  return trimmed;
}

function isActive(hunt, nowMs) {
  if (!hunt) {
    return false;
  }

  if (nowMs === undefined) {
    nowMs = Date.now();
  }

  const startsOn = Number(hunt.startsOn) || 0;
  const endsOn = Number(hunt.endsOn) || 0;

  if (startsOn > nowMs) {
    return false;
  }

  if (endsOn !== 0 && endsOn < nowMs) {
    return false;
  }

  return true;
}
