import {  getdata, putdata } from "./api.js";
import { findancestorbytype } from "./dom.js";
import {
  showform,
  getformfieldvalue,
  setformfieldvalue,
  clearform,
  gettablebody,
  cleartablerows,
} from "./form.js";

document.addEventListener("DOMContentLoaded", async function () {
  document
    .getElementById("addlandlord")
    .addEventListener("click", addlandlordinput);
  await golandlords();
});

/**
 *
 * @returns { Promise< object > }
 */
async function fetchlandlords() {
  return await getdata("landlords");
}

/**
 * @param { string } contact
 * @param { string } landlord
 * @param { Array<string> } buildings
 * @returns { Promise< object > }
 */
async function addlandlord(landlord, buildings, contact) {
  await putdata("landlords", {
    landlord,
    buildings,
    contact,
  });
}

/**
 *
 * @param { string } id
 * @param { Array<string> } buildings
 * @param { string } landlord
 * @param { string } contact
 */
async function updatelandlord(id, landlord, buildings, contact) {
  await putdata("landlords", {
    id,
    landlord,
    buildings,
    contact,
  });
}



/**
 * @returns { Promise }
 */
async function golandlords() {
  const p = await fetchlandlords();
  console.log(p);
  cleartablerows("landlordtable");

  for (const pi in p) {
    addlandlorddom(p[pi]);
  }
}

/**
 *
 */
function addlandlordinput() {
  clearform("landlordform");
  showform("landlordform", async () => {
    const buildings = [];
    for (let i = 1; i < 6; i++) {
      let value = getformfieldvalue(`landlordform-build-${i}`);
      buildings.push(value);
    }
    await addlandlord(
      getformfieldvalue("landlordform-landlord"),
      buildings,
      getformfieldvalue("landlordform-contact")
    );

    await golandlords();
  });
}

/**
 * @param {event} e
 */
function editlandlord(e) {
  clearform("landlordform");
  const landlordrow = findancestorbytype(e.target, "tr");
  landlordrow.landlord.buildings.forEach((building, index) => {
    setformfieldvalue(`landlordform-build-${index + 1}`, building);
  });

  setformfieldvalue("landlordform-landlord", landlordrow.landlord.landlord);
  setformfieldvalue("landlordform-contact", landlordrow.landlord.contact);

  showform("landlordform", async () => {
    const buildings = [];
    for (let i = 1; i < 6; i++) {
      let value = getformfieldvalue(`landlordform-build-${i}`);
      buildings.push(value);
    }
    await updatelandlord(
      landlordrow.landlord.id,
      getformfieldvalue("landlordform-landlord"),
      buildings,
      getformfieldvalue("landlordform-contact")
    );
    await golandlords();
  });
}

/**
 *
 * @param { object } landlord
 */
export function addlandlorddom(landlord) {
  const table = gettablebody("landlordtable");
  const newrow = table.insertRow();

  const cells = [];
  for (let i = 0; i < 11; i++) {
    cells.push(newrow.insertCell(i));
  }

  // @ts-ignore
  newrow.landlord = landlord;
  cells[0].innerText = landlord.landlord;
  cells[9].innerText = landlord.contact;
  for (let j = 0; j < landlord.buildings.length; j++) {
    cells[j + 3].innerText = landlord.buildings[j];
  }

  const editbutton = document.createElement("button");
  editbutton.textContent = "Edit Landlord";
  editbutton.addEventListener("click", editlandlord);
  cells[10].appendChild(editbutton);
}
