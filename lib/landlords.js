


/**
 * @typedef { Object } landlord
 * @property { number } id
 * @property { string } landlord - The name of the landlord.
 * @property { Array<string> } buildings - The name of the buildings owned by landloard.
 * @property { string } contact - phone number of the landlord .
 */

/**
 * @type { Array< landlord > }
 */





/**
 * Fetch landlords from SQLite database
 * @param {string} parsedurl
 * @param {string} method
 * @param {object} receivedobj
 * @param { import('sqlite3').Database } db - SQLite database connection
 * @returns {Promise<Array>} - Promise resolving to array of landlords
 */
async function get(parsedurl, method, receivedobj, db) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM landlords', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        // Parse buildings JSON string to array in each landlord record
        const landlords = rows.map(row => ({
          id: row.id,
          landlord: row.landlord,
          buildings: JSON.parse(row.buildings),
          contact: row.contact
        }));
        resolve(landlords);
      }
    });
  });
}

/**
 * Add or update a landlord in the database
 * @param {string} parsedurl
 * @param {string} method
 * @param {landlord} landlord
 * @param { import('sqlite3').Database } db - SQLite database connection
 * @returns {Promise<landlord>}
 */
async function add(parsedurl, method, landlord, db) {
  return new Promise((resolve, reject) => {
    if (landlord.id !== undefined) {
      // Try updating existing landlord
      const sqlUpdate = `UPDATE landlords SET landlord = ?, buildings = ?, contact = ? WHERE id = ?`;
      // stringify buildings array to store as JSON string
      const buildingsStr = JSON.stringify(landlord.buildings);

      db.run(sqlUpdate, [landlord.landlord, buildingsStr, landlord.contact, landlord.id], function(err) {
        if (err) return reject(err);

        if (this.changes === 0) {
          // No rows updated, insert new landlord
          const sqlInsert = `INSERT INTO landlords (landlord, buildings, contact) VALUES (?, ?, ?)`;
          db.run(sqlInsert, [landlord.landlord, buildingsStr, landlord.contact], function(err) {
            if (err) return reject(err);
            landlord.id = this.lastID;
            resolve(landlord);
          });
        } else {
          resolve(landlord);
        }
      });
    } else {
      // Insert new landlord with stringified buildings array
      const sqlInsert = `INSERT INTO landlords (landlord, buildings, contact) VALUES (?, ?, ?)`;
      const buildingsStr = JSON.stringify(landlord.buildings);

      db.run(sqlInsert, [landlord.landlord, buildingsStr, landlord.contact], function(err) {
        if (err) return reject(err);
        landlord.id = this.lastID;
        resolve(landlord);
      });
    }
  });
}



module.exports = {
  get,
  add,
}