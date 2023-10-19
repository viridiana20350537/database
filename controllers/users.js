const {request, response} = require('express');
const usersModel = require('../models/users');
const pool = require('../db');

const listUsers = async (req = request, res = response) => {
    let conn;
        try {
            conn = await pool.getConnection();
            const users = await conn.query(usersModel.getAll,(err) => { 
                if (err) {
                    throw err
                }     
            });
            res.json(users);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}

const listUserByID = async (req = request, res = response) => {
    const {id} = req.params;

    if (isNaN(id)) {
        res.status(400).json({msg:'Invalid ID'});
        return;
    }

    let conn;
        try {
            conn = await pool.getConnection();
            const [user] = await conn.query(usersModel.getByID, [id], (err) => { 
                if (err) {
                    throw err
                }     
            });

            if (!user) {
                res.status(404).json({msg: 'User no found'});
                return;
            }

            res.json(user);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}
/*
{
    username: 'admin',
    email: 'admin@example.com',
    password: '123',
    name: 'Administrador',
    lastname: 'Del Sitio',
    phone_number: '5555',
    role_id: '1',
    is_active: '1'
}
*/ 

const addUser = async (req = request, res = response) => {

    const {
        username,
        email,
        password,
        name,
        lastname,
        phone_number = '',
        role_id,
        is_active = 1
    } = req.body;

    if (!username || !email || !password || !name || !lastname || !role_id) {
        res.status(400).json({msg:'Missing information'});
        return;
    }

    const user = [username, email, password, name, lastname, phone_number, role_id, is_active]

    let conn;

    try {
        conn = await pool.getConnection();

        const [usernameUser] = await conn.query(
            usersModel.getByUsername,
            [username],
            (err) => {if (err) throw err;}
        );
        if (usernameUser) {
            res.status(409).json({msg: `User with username ${username} alredy exist`});
            return;
        }

        const [emailUser] = await conn.query(
            usersModel.getByEmail,
            [email],
            (err) => {if (err) throw err;}
        );
        if (emailUser) {
            res.status(409).json({msg: `User with username ${email} alredy exist`});
            return;
        }

        const userAdded= await conn.query(usersModel.addRow, [...user], (err) => {
            if (err) throw err;
        });
        if (userAdded.affectedRows == 0) throw new Error ({message: 'Failed to add user'});
        res.json({msg:'User added succesfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
  }

//incia movida    
const updateUser = async (req, res) => {
  const { id } = req.params;
  const userData = req.body; // Datos a actualizar

  if (!userData || Object.keys(userData).length === 0) {
    return res.status(400).json({ msg: 'No data provided for update' });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Verificar si el usuario existe
    const [existingUser] = await conn.query(usersModel.getByID, [id]);
    if (!existingUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Realiza las validaciones necesarias, por ejemplo, que el correo o el nombre de usuario no estén en uso
    
    if (userData.username) {
      const [existingUserByUsername] = await conn.query(
        usersModel.getByUsername,
        [userData.username]
      );
      if (existingUserByUsername && existingUserByUsername.id !== id) {
        return res.status(409).json({ msg: 'Username already in use' });
      }
    }
    if (userData.email) {
      const [existingUserByEmail] = await conn.query(
        usersModel.getByEmail,
        [userData.email]
      );
      if (existingUserByEmail && existingUserByEmail.id !== id) {
        return res.status(409).json({ msg: 'Email already in use' });
      }
    }

    // Realiza la actualización de los campos permitidos
    const allowedFields = ['username', 'email', 'password', 'name', 'lastname', 'phone_number', 'is_active'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (userData[field] !== undefined) {
        updateData[field] = userData[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ msg: 'No valid fields to update' });
    }

    // Utiliza la consulta updateUser para realizar la actualización
    const result = await conn.query(
      usersModel.updateUser,
      [
        updateData.username,
        updateData.email,
        updateData.password, // Actualizar contraseña
        updateData.name,
        updateData.lastname,
        updateData.phone_number,
        updateData.is_active,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ msg: 'Failed to update user' });
    }

    return res.json({ msg: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  } finally {
    if (conn) conn.end();
  }
};
//termina movida

const deleteUser = async (req =request, res =response) => {
  let conn;
  const {id} = req.params;

  try{
    conn = await pool.getConnection();

    const [userExits] = await conn.query(
      usersModel.getByID,
      [id],
      (err) => {throw err;}
    )
    if (!userExits || userExits.is_active == 0){
      res.status(404).json({msg:'User not found'});
      return;
    }

    const userDeleted = await conn.query(
      usersModel.deleteRow,
      [id],
      (err) => {if (err) throw err;}
    )
    if (userDeleted.affectedRows == 0) {
      throw new Error ({message: 'Failed to delete user'})
    };

    res.json({msg:'User deleted successfully'});

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  } finally {
    if (conn) conn.end();
  }
}

module.exports = {listUsers, listUserByID, addUser, updateUser, deleteUser};