const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

// DB initialize करा
function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ documents: [] }));
  }
}

// सगळे documents आणा
function getAll() {
  initDB();
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  return data.documents;
}

// Document save करा
function save(doc) {
  initDB();
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  const newDoc = {
    _id: Date.now().toString(),
    ...doc,
    createdAt: new Date().toISOString()
  };
  data.documents.push(newDoc);
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  return newDoc;
}

// ID ने document शोधा
function findById(id) {
  initDB();
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  return data.documents.find(d => d._id === id);
}

module.exports = { save, findById, getAll };