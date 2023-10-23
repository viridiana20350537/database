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


const updateUser = async (req = request, res = response) => {
  let conn;
  const {id} = req.params;

  const {
    username,
    email,
    password,
    name,
    lastname,
    phone_number,
    role_id,
    is_active
} = req.body;

let user = [    
  username,
  email,
  password,
  name,
  lastname,
  phone_number,
  role_id,
  is_active
]

  try {
    conn = await pool.getConnection();
    const [userExist] = await conn.query()
    usersModel.getByID,
    [id],
    (err) => {throw err;}

  if (!userExist ||  userExist.is_active == 0) {
    res.status(404).json({msg:'User not found'});
    return;
  }

  if (username == userExist.username){
    res.status(409).json({msg:'Usrname alredy exist'});
    return;
  }

  if (username == userExist.email){
    res.status(409).json({msg:'Email alredy exist'});
    return;
  }

  let oldUser = [
    userExist.username,
    userExist.email,
    userExist.password,
    userExist.name,
    userExist.lastname,
    userExist.phone_number,
    userExist.role_id,
    userExist.is_active
  ]

  user.forEach((userData, index) => {
    if (!userData) {
    user [index] = oldUser[index]
    };
  })

  const [userUpdate] = conn.query(
    usersModel.updateRow,
    [...user,id],
    (err) => {
    throw err;
  }
  )

  if (userUpdate.affectedRows == 0) {
    throw new Error('User not updated');
  }

  res.json({msg:'User updated successfully'});
  } catch (error) {
    console.log(error);
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