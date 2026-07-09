const express = require("express");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const usuario = {
            nome: payload.name,
            email: payload.email,
            foto: payload.picture
        };

        console.log("Usuário autenticado:");
        console.log(usuario);

        // Futuramente você pode salvar no banco aqui

        res.status(200).json({
            success: true,
            usuario
        });

    } catch (error) {
        console.error("Erro na autenticação:", error);

        res.status(401).json({
            success: false,
            message: "Token inválido."
        });
    }
});

module.exports = router;