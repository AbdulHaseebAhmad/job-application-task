


/**
 * @typedef { Object } building
 * @property { number } id
 * @property { string } building - The name of the building.
 * @property { string } landlord - The name of the landloard.
 * @property { string } rooms - The rooms in the building.
 * @property { string } availability - availibbility in the building .
 * @property { string } contact - phone number of the building .
 */

/**
 * @type { Array< building > }
 */


/**
 * Fetch buildings from SQLite database
 * @param {string} parsedurl
 * @param {string} method
 * @param {object} receivedobj
 * @param { import('sqlite3').Database } db - SQLite database connection
 * @returns {Promise<Array<building>>}
 */
async function get(parsedurl, method, receivedobj, db) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM buildings', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });}

/**
 * Add or update a building in the database
 * @param {string} parsedurl
 * @param {string} method
 * @param {building} building
 * @param { import('sqlite3').Database } db - SQLite database connection
 * @returns {Promise<building>}
 */
async function add(parsedurl, method, building, db) {
  return new Promise((resolve, reject) => {
    if (building.id !== undefined) {
      // Try updating existing building
      const sqlUpdate = `UPDATE buildings SET building = ?, landlord = ?, rooms = ?, availability = ?, contact = ? WHERE id = ?`;

      db.run(sqlUpdate, [building.building, building.landlord, building.rooms, building.availability, building.contact, building.id], function(err) {
        if (err) return reject(err);

        if (this.changes === 0) {
          // No rows updated, insert new building
          const sqlInsert = `INSERT INTO buildings (building, landlord, rooms, availability, contact) VALUES (?, ?, ?, ?, ?)`;
          db.run(sqlInsert, [building.building, building.landlord, building.rooms, building.availability, building.contact], function(err) {
            if (err) return reject(err);
            building.id = this.lastID;
            resolve(building);
          });
        } else {
          resolve(building);
        }
      });
    } else {
      // Insert new building
      const sqlInsert = `INSERT INTO buildings (building, landlord, rooms, availability, contact) VALUES (?, ?, ?, ?, ?)`;
      db.run(sqlInsert, [building.building, building.landlord, building.rooms, building.availability, building.contact], function(err) {
        if (err) return reject(err);
        building.id = this.lastID;
        resolve(building);
      });
    }
  });
}



module.exports = {
  get,
  add,
}