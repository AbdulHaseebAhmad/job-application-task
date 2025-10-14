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
    .getElementById("addbuilding")
    .addEventListener("click", addbuildinginput);
  await gobuildings();
});

/**
 *
 * @returns { Promise< object > }
 */
async function fetchbuildings() {
  return await getdata("buildings");
}

/**
 * @param { string } building
 * @param { string } availability
 * @param { string } rooms
 * @param { string } contact
 * @param { string } landlord
 * @returns { Promise< object > }
 */
async function addbuilding(building, landlord, availability, rooms, contact) {
  await putdata("buildings", {
    building,
    landlord,
    availability,
    rooms,
    contact,
  });
}

/**
 *
 * @param { string } id
 * @param { string } building
 * @param { string } landlord
 * @param { string } availability
 * @param { string } rooms
 * @param { string } contact
 */
async function updatebuilding(
  id,
  building,
  landlord,
  availability,
  rooms,
  contact
) {
  await putdata("buildings", {
    id,
    building,
    landlord,
    availability,
    rooms,
    contact,
  });
}

/**
 * @param {event} e
 */

async function deletebuilding(e) {
  const buildingrow = findancestorbytype(e.target, "tr");
  const id = buildingrow.building.id;
  await deletedata("buildings", { id });
}

/**
 * @returns { Promise }
 */
async function gobuildings() {
  const p = await fetchbuildings();
  console.log(p);
  cleartablerows("buildingtable");

  for (const pi in p) {
    addbuildingdom(p[pi]);
  }
}

/**
 *
 */
function addbuildinginput() {
  clearform("buildingform");
  showform("buildingform", async () => {
    await addbuilding(
      getformfieldvalue("buildingform-building"),
      getformfieldvalue("buildingform-landlord"),
      getformfieldvalue("buildingform-availability"),
      getformfieldvalue("buildingform-rooms"),
      getformfieldvalue("buildingform-contact")
    );

    await gobuildings();
  });
}

/**
 * @param {event} e
 */
function editBuilding(e) {
  clearform("buildingform");
  const buildingrow = findancestorbytype(e.target, "tr");
  setformfieldvalue("buildingform-building", buildingrow.building.building);
  setformfieldvalue("buildingform-landlord", buildingrow.building.landlord);
  setformfieldvalue(
    "buildingform-availability",
    buildingrow.building.availability
  );
  setformfieldvalue("buildingform-rooms", buildingrow.building.rooms);
  setformfieldvalue("buildingform-contact", buildingrow.building.contact);

  showform("buildingform", async () => {
    await updatebuilding(
      buildingrow.building.id,
      getformfieldvalue("buildingform-building"),
      getformfieldvalue("buildingform-landlord"),
      getformfieldvalue("buildingform-availability"),
      getformfieldvalue("buildingform-rooms"),
      getformfieldvalue("buildingform-contact")
    );
    await gobuildings();
  });
}

/**
 *
 * @param { object } building
 */
export function addbuildingdom(building) {
  const table = gettablebody("buildingtable");
  const newrow = table.insertRow();

  const cells = [];
  for (let i = 0; i < 7; i++) {
    cells.push(newrow.insertCell(i));
  }

  // @ts-ignore
  newrow.building = building;
  cells[0].innerText = building.building;
  cells[1].innerText = building.landlord;
  cells[2].innerText = building.rooms;
  cells[3].innerText = building.availability;
  cells[4].innerText = building.contact;

  const editbutton = document.createElement("button");
  editbutton.textContent = "Edit Building";
  editbutton.addEventListener("click", editBuilding);
  cells[5].appendChild(editbutton);
}
