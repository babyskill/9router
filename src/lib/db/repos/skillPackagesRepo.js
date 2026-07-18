import { v4 as uuidv4 } from "uuid";
import { getAdapter } from "../driver.js";
import { parseJson, stringifyJson } from "../helpers/jsonCol.js";

function rowToPackage(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    skills: parseJson(row.skills, []),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getSkillPackages() {
  const db = await getAdapter();
  const rows = db.all(`SELECT * FROM skillPackages ORDER BY name ASC`);
  return rows.map(rowToPackage);
}

export async function getSkillPackageById(id) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM skillPackages WHERE id = ?`, [id]);
  return rowToPackage(row);
}

export async function getSkillPackageByName(name) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM skillPackages WHERE name = ?`, [name]);
  return rowToPackage(row);
}

export async function createSkillPackage(data) {
  const db = await getAdapter();
  const now = new Date().toISOString();
  const pkg = {
    id: uuidv4(),
    name: data.name,
    description: data.description || null,
    skills: data.skills || [],
    createdAt: now,
    updatedAt: now,
  };
  db.run(
    `INSERT INTO skillPackages(id, name, description, skills, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?)`,
    [pkg.id, pkg.name, pkg.description, stringifyJson(pkg.skills), pkg.createdAt, pkg.updatedAt]
  );
  return pkg;
}

export async function updateSkillPackage(id, data) {
  const db = await getAdapter();
  let result = null;
  db.transaction(() => {
    const row = db.get(`SELECT * FROM skillPackages WHERE id = ?`, [id]);
    if (!row) return;
    const merged = { ...rowToPackage(row), ...data, updatedAt: new Date().toISOString() };
    db.run(
      `UPDATE skillPackages SET name = ?, description = ?, skills = ?, updatedAt = ? WHERE id = ?`,
      [merged.name, merged.description, stringifyJson(merged.skills || []), merged.updatedAt, id]
    );
    result = merged;
  });
  return result;
}

export async function deleteSkillPackage(id) {
  const db = await getAdapter();
  const res = db.run(`DELETE FROM skillPackages WHERE id = ?`, [id]);
  return (res?.changes ?? 0) > 0;
}
