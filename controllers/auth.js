const { response } = require('express')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
//TO DO: validations like min and max chars
const Usuario = require('../models/Usuario')
const { generateJWT } = require('../helpers/JWT')
const createUser = async (req, res = response) => {
    const { email, password, user_type, english_level, con_tecn, link_cv } = req.body
    try {
        let usuario = await Usuario.findOne({ email })
        if (usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Un usuario ya tiene ese correo'
            })
        }
        usuario = new Usuario(req.body)
        //encrypt password
        const salt = bcrypt.genSaltSync()
        usuario.password = bcrypt.hashSync(password, salt)

        await usuario.save()
        //JWT
        const token = await generateJWT(usuario.id, usuario.name)

        //response
        res.status(201).json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            user_type,
            english_level,
            con_tecn,
            link_cv,
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Por favor comuníquese con TI'
        })
    }
}
const logUser = async (req, res = response) => {
    const { email, password } = req.body;
    try {
        let usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        const validPassword = bcrypt.compareSync(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Password incorrecto'
            });
        }

        const token = await generateJWT(usuario.id, usuario.name);

        res.json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            user_type: usuario.user_type, // Include the user_type in the response
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor comuníquese con TI'
        });
    }
};
const reToken = async (req, res = response) => {
    const { uid, name } = req;
    const token = await generateJWT(uid, name)
    //response  
    res.json({
        ok: true,
        uid,
        name,
        msg: 'Renew'
    })
}

const getAllUsers = async (req, res) => {
    try {
        const users = await Usuario.find({})
        res.json({
            ok: true,
            users
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Por favor comuníquese con TI'
        })
    }
}

const deleteUser = async (req, res) => {
    const { userId } = req.body;
    try {
        // Buscar y eliminar usuario
        const usuario = await Usuario.findByIdAndDelete(userId);
        if (!usuario) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }
        // Respuesta
        res.json({
            ok: true,
            msg: 'Usuario eliminado correctamente'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor comuníquese con TI'
        });
    }
};

const updateUser = async (req, res) => {
    const { userId, name, email, password, user_type, english_level, con_tecn, link_cv } = req.body;
    try {
        // Find the user by ID
        let usuario = await Usuario.findById(userId);
        if (!usuario) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        // Check if the email is already used by another user
        const existingUser = await Usuario.findOne({ email });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo electrónico ya está en uso por otro usuario'
            });
        }

        // Update the user data
        usuario.name = name;
        usuario.email = email;
        usuario.user_type = user_type;
        usuario.english_level = english_level;
        usuario.con_tecn = con_tecn;
        usuario.link_cv = link_cv;
        // Only update the password if a new password is provided
        if (password) {
            const salt = bcrypt.genSaltSync();
            usuario.password = bcrypt.hashSync(password, salt);
        }

        // Save the updated user
        await usuario.save();

        // Response
        res.json({
            ok: true,
            usuario
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor comuníquese con TI'
        });
    }
};
module.exports = {
    createUser,
    logUser,
    reToken,
    getAllUsers,
    deleteUser,
    updateUser
}