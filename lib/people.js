


/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { Array <string> } schedule
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 */

/**
 * @type { Array< person > }
 */

/**
 * Demo function to return an array of people objects
 * @param { string } parsedurl
 * @param { string } method
 * @param { object } receivedobj
 * @param { import('sqlite3').Database } db - SQLite database connection

 */
async function get(parsedurl, method, receivedobj, db) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM people', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        // Parse the schedule JSON string back to array for each person
        const people = rows.map(row => ({
          id: row.id,
          name: row.name,
          email: row.email,
          notes: row.notes,
          schedule: JSON.parse(row.schedule)
        }));
        resolve(people);
      }
    });
  });
}

/**
 * Add or update a person by first checking existence
 * @param {string} parsedurl
 * @param {string} method
 * @param {person} person
 * @param { import('sqlite3').Database } db - SQLite database connection
 * @returns {Promise<person>}
 */
async function add(parsedurl, method, person, db) {
  return new Promise((resolve, reject) => {
    const scheduleStr = JSON.stringify(person.schedule);

    if (person.id !== undefined) {
      // First check if the person exists
      db.get('SELECT id FROM people WHERE id = ?', [person.id], (err, row) => {
        if (err) return reject(err);

        if (row) {
          // Person exists, update
          const sqlUpdate = `UPDATE people SET name = ?, email = ?, notes = ?, schedule = ? WHERE id = ?`;
          db.run(sqlUpdate, [person.name, person.email, person.notes, scheduleStr, person.id], function(err) {
            if (err) return reject(err);
            resolve(person);
          });
        } else {
          // Person does not exist, insert new
          const sqlInsert = `INSERT INTO people (name, email, notes, schedule) VALUES (?, ?, ?, ?)`;
          db.run(sqlInsert, [person.name, person.email, person.notes, scheduleStr], function(err) {
            if (err) return reject(err);
            person.id = this.lastID;
            resolve(person);
          });
        }
      });
    } else {
      // No person.id provided, just insert new
      const sqlInsert = `INSERT INTO people (name, email, notes, schedule) VALUES (?, ?, ?, ?)`;
      db.run(sqlInsert, [person.name, person.email, person.notes, scheduleStr], function(err) {
        if (err) return reject(err);
        person.id = this.lastID;
        resolve(person);
      });
    }
  });
}



module.exports = {
  get,
  add,
}