function chunkText(text, chunkSize = 1000, overlap = 200) {

    // Remove NULL characters that PostgreSQL cannot store
    const cleanText = text.replace(/\u0000/g, "");

    const chunks = [];

    let start = 0;

    while (start < cleanText.length) {

        const end = start + chunkSize;

        const chunk = cleanText
            .slice(start, end)
            .trim();

        if (chunk.length > 0) {
            chunks.push({
                text: chunk,
                start,
                end: Math.min(end, cleanText.length)
            });
        }

        start += chunkSize - overlap;
    }

    return chunks;
}

module.exports = {
    chunkText
};