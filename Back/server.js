require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/auth/google", async (req, res) => {
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

        res.json({
            success: true,
            usuario
        });

    } catch (erro) {
        console.error(erro);

        res.status(401).json({
            success: false,
            mensagem: "Token inválido."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});