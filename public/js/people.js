import {  getdata, putdata } from "./api.js";
import {
  showform,
  getformfieldvalue,
  setformfieldvalue,
  clearform,
  gettablebody,
  cleartablerows,
} from "./form.js";
import { findancestorbytype } from "./dom.js";

document.addEventListener("DOMContentLoaded", async function () {
  document
    .getElementById("addperson")
    .addEventListener("click", addpersoninput);
  await gopeople();
});

/**
 *
 * @returns { Promise< object > }
 */
async function fetchpeople() {
  return await getdata("people");
}

/**
 * @param { string } name
 * @param { Array <string> } schedule
 * @param { string } email
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function addperson(name, schedule, email, notes) {
  await putdata("people", { name, schedule, email, notes });
}

/**
 *
 * @param { string } id
 * @param { string } name
 *  * @param { Array <string> } schedule
 * @param { string } email
 * @param { string } notes
 */
async function updateperson(id, name, schedule, email, notes) {
  await putdata("people", { id, name, schedule, email, notes });
}



/**
 * @returns { Promise }
 */
async function gopeople() {
  const p = await fetchpeople();
  console.log(p);
  cleartablerows("peopletable");

  for (const pi in p) {
    addpersondom(p[pi]);
  }
}

/**
 *
 */
function addpersoninput() {
  clearform("personform");
  showform("personform", async () => {
    let schedule = [];
    for (let i = 1; i < 8; i++) {
      let value = getformfieldvalue(`personform-day-${i}`);
      schedule.push(value);
    }
    await addperson(
      getformfieldvalue("personform-name"),
      schedule,
      getformfieldvalue("personform-email"),
      getformfieldvalue("personform-notes")
    );
    await gopeople();
  });
}

/**
 * @param {event} e
 */
function editperson(e) {
  clearform("personform");

  const personrow = findancestorbytype(e.target, "tr");
  setformfieldvalue("personform-name", personrow.person.name);
  personrow.person.schedule.forEach((each, index) =>
    setformfieldvalue(`personform-day-${index + 1}`, each)
  );
  setformfieldvalue("personform-email", personrow.person.email);
  setformfieldvalue("personform-notes", personrow.person.notes);

  showform("personform", async () => {
    let schedule = [];
    for (let i = 1; i < 8; i++) {
      let value = getformfieldvalue(`personform-day-${i}`);
      schedule.push(value);
    }
    await updateperson(
      personrow.person.id,
      getformfieldvalue("personform-name"),
      schedule,
      getformfieldvalue("personform-email"),
      getformfieldvalue("personform-notes")
    );
    await gopeople();
  });
}

/**
 *
 * @param { object } person
 */
export function addpersondom(person) {
  const table = gettablebody("peopletable");
  const newrow = table.insertRow();

  const cells = [];
  for (let i = 0; i < 11; i++) {
    cells.push(newrow.insertCell(i));
  }

  // @ts-ignore
  newrow.person = person;
  cells[0].innerText = person.name;
  cells[8].innerText = person.email;
  cells[9].innerText = person.notes;

  for (let i = 0; i < person.schedule.length; i++) {
    cells[i + 1].innerText = person.schedule[i];
  }

  const editbutton = document.createElement("button");
  editbutton.textContent = "Edit Person";
  editbutton.addEventListener("click", editperson);
  cells[10].appendChild(editbutton);
 
}
