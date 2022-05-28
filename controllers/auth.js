const { response } = require("express");
const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const {generarJWT}=require('../helpers/jwt');

const crearUsuario = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    let usuario = await Usuario.findOne({ email: email });
    console.log('ASDASD')
    console.log(usuario)
    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "Un usuario existe con ese correo",
      });
    }

    usuario = new Usuario(req.body);

    //encriptar contraseña
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    await usuario.save();
    
    //GENERAR JWT
    const token = await generarJWT(usuario.id, usuario.name);

    res.status(201).json({
      ok: true,
      uid: usuario.id,
      name: usuario.name,
      token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Por favor, hable con el administrador",
    });
  }
};

const loginUsuario = async(req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email: email });
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "Un usuario no existe con ese correo",
      });
    }
    //confirmaar 2 passwd
    const validPassword = bcrypt.compareSync(password, usuario.password);

    if(!validPassword){
      return res.status(400).json({
        ok: false,
        msg: 'password incorrecto'
      })
    }

    //generar nuestro JWT
    //GENERAR JWT
    const token = await generarJWT(usuario.id, usuario.name);

    res.json({
      ok: true,
      uid: usuario.id,
      name: usuario.name,
      token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Por favor, hable con el administrador",
    });
  }
};

const revalidarToken = async(req, res) => {
  const {uid, name} = req;
  
  const token = await generarJWT(uid, name);
  res.json({
    ok: true,
    uid,
    token,
    name
  });
};

module.exports = {
  crearUsuario,
  loginUsuario,
  revalidarToken,
};
