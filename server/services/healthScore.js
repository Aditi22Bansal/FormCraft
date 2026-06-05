function calculateHealthScore({ fields, completionRate, avgTime, dropOff, sentimentByField, responses }) {
  let score = 100;
  const suggestions = [];

  if (fields.length > 10) {
    const penalty = (fields.length - 10) * 3;
    score -= penalty;
    suggestions.push('Too many fields — consider splitting into multiple forms');
  }

  if (completionRate < 50) {
    score -= 20;
    suggestions.push('Low completion rate — simplify required fields');
  }

  if (avgTime > 300) {
    score -= 10;
    suggestions.push('Average completion time is high — reduce field count');
  }

  const highDropOff = (dropOff || []).find((d) => d.percentage < 60);
  if (highDropOff) {
    score -= 15;
    suggestions.push(`High drop-off at "${highDropOff.label}" — review that field`);
  }

  let negCount = 0;
  let totalSentiment = 0;
  responses.forEach((r) => {
    r.answers.forEach((a) => {
      if (a.sentiment?.label) {
        totalSentiment++;
        if (a.sentiment.label === 'negative') negCount++;
      }
    });
  });
  const negRatio = totalSentiment > 0 ? negCount / totalSentiment : 0;
  if (negRatio > 0.3) {
    score -= 10;
    suggestions.push('High negative sentiment — review open-ended questions');
  }

  score = Math.max(0, Math.min(100, score));
  return { score, suggestions };
}

module.exports = { calculateHealthScore };
