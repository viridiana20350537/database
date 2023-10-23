const usersModel = {
  getAll:`
          SELECT 
              * 
          FROM 
              Users`,

  getByID : `
          SELECT
              *
          FROM
              Users
          WHERE
              id = ?
          `,
  
  addRow: `
          INSERT INTO
              Users (
                  username,
                  email,
                  password,
                  name,
                  lastname,
                  phone_number,
                  role_id,
                  is_active
              ) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  
  getByUsername: `
          SELECT 
              id 
          FROM
              Users
          WHERE
              username = ?
  `,

  getByEmail: `
          SELECT 
              id
          FROM
              Users
          WHERE
              email = ?
  `, 

 updateRow: `
UPDATE 
   Users
SET 
    username = ?,
    email = ?,
    password = ?,
    name = ?,
    lastname = ?,
    phone_number = ?,
    role_id = ?,
    is_active = ?
WHERE
    id = ?
`,

  deleteRow: `
      UPDATE 
          Users
      SET 
          is_active = 0
      WHERE
          id = ?
  `,
}

module.exports = usersModel;