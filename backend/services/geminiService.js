const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const csv = require('csv-parser');
const mammoth = require('mammoth');


const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean);

let currentKeyIndex = 0;

function getModel() {
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

async function callWithRetry(contentsFn, retries = 8) {
  for (let i = 0; i < retries; i++) {
    try {
      const model = getModel();
      const contents = contentsFn();
      return await model.generateContent(contents);
    } catch (err) {
      if (err.status === 503) {
        const waitTime = 3000;
        console.log(`⏳ Retrying in 3s...`);
        await new Promise(res => setTimeout(res, waitTime));
        continue;
      }
      if (err.status === 429 || err.status === 403) {
        console.log(`⚠️ Key ${currentKeyIndex} issue, दुसरी try करतो...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error('सध्या AI busy आहे. थोड्या वेळाने try करा.');
}

async function extractCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => {
        const fields = {};
        if (results.length > 0) {
          Object.keys(results[0]).forEach(key => {
            fields[key] = results.map(r => r[key]);
          });
        }
        resolve({
          documentType: 'csv',
          extractedFields: fields,
          summary: `CSV file with ${results.length} rows and ${Object.keys(fields).length} columns`,
          rawData: results
        });
      })
      .on('error', reject);
  });
}

async function extractData(filePath, mimeType) {
  if (mimeType === 'text/csv') {
    return await extractCSV(filePath);
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammothResult = await mammoth.extractRawText({ path: filePath });
    const text = mammothResult.value;
    const model = getModel();

    const prompt = `You are a document extraction expert.
Extract all structured data from this document text.
Return JSON format with fields like:
- documentType (invoice/hr/other)
- extractedFields (all key-value pairs)
- summary (brief description)
Only return valid JSON, nothing else.

Document text:
${text}`;

    const aiResult = await callWithRetry(() => prompt);
    const aiText = aiResult.response.text();
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: aiText };
  }

  const model = getModel();
  const fileData = fs.readFileSync(filePath);
  const base64 = fileData.toString('base64');

  const prompt = `You are a document extraction expert.
Extract all structured data from this document.
Return JSON format with fields like:
- documentType (invoice/hr/other)
- extractedFields (all key-value pairs)
- summary (brief description)
Only return valid JSON, nothing else.`;

  const result = await callWithRetry(() => [
  { inlineData: { data: base64, mimeType } },
  prompt
]);

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
}

async function chatWithDocument(extractedData, userQuestion) {
  const model = getModel();

  let contextData;
  if (extractedData.documentType === 'csv') {
    const fields = extractedData.extractedFields;
    const rows = extractedData.rawData;
    contextData = `Document Type: CSV
Summary: ${extractedData.summary}
Columns: ${Object.keys(fields).join(', ')}
Data (all rows):
${rows.map((row, i) =>
  `Row ${i+1}: ${Object.entries(row).map(([k,v]) => `${k}=${v}`).join(', ')}`
).join('\n')}`;
  } else {
    contextData = JSON.stringify(extractedData, null, 2);
  }

  const prompt = `You are a helpful assistant analyzing document data.
Here is the document data:
${contextData}

User question: ${userQuestion}

Answer clearly and accurately based on the document data.
If asked for calculations like sum/average/count, calculate and provide the exact answer.
Answer in the same language as the question.`;

  const result = await callWithRetry(() => prompt);
  return result.response.text();
}

module.exports = { extractData, chatWithDocument };

