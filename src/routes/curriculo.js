import { Router } from "express";
import Curriculo from "../models/curriculo";
import admin from "firebase-admin";

admin.initializeApp({
	credential: admin.credential.cert("serviceAccountKey.json"),
});

// Middleware para verificar o token de autenticação do Firebase.
const verifyIdToken = async (req, res, next) => {
	try {
		const idToken = req.header("Authorization").split("Bearer ")[1];
		const decodedToken = await admin.auth().verifyIdToken(idToken);
		req.user = decodedToken;
		next();
	} catch (error) {
		return res.status(401).send("Token de autenticação inválido");
	}
};

// Middleware para verificar se o usuário é um administrador.
const checkAdmin = async (req, res, next) => {
	const uid = req.user.uid;
	const userRecord = await admin.auth().getUser(uid);

	if (userRecord.customClaims && userRecord.customClaims.admin === true) {
		// O usuário é um administrador.
		next();
	} else {
		return res.status(403).send("Acesso negado. Você não é um administrador.");
	}
};

const router = Router();

// Rota de login

router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await admin.auth().getUserByEmail(email);
		// Autenticar o usuário com Firebase Admin SDK
		await admin.auth().verifyPassword(user.uid, password);

		res.send(`Usuário ${user.displayName} logado com sucesso.`);
	} catch (error) {
		console.error("Erro no login:", error);
		res.status(401).send("Credenciais inválidas. Verifique seu e-mail e senha.");
	}
});

router.post("/criar-usuario", async (req, res) => {
	const { email, password, displayName } = req.body;

	try {
		const user = await admin.auth().createUser({
			email,
			password,
			displayName,
		});
		res.status(201).json(user);
	} catch (error) {
		console.error("Erro ao criar usuário:", error);
		res.status(400).json({ error: error.message });
	}
});

router.get("/", async (req, res) => {
	const { id } = req.query;
	if (id) {
		try {
			const curriculo = await Curriculo.findByPk(id);
			if (!curriculo) {
				return res.status(404).json({ error: "Curriculo não encontrado!" });
			}
			return res.status(200).json(curriculo);
		} catch (error) {
			return res.status(500).json({ error: error.message ?? "Erro ao obter Curriculo!" });
		}
	} else {
		try {
			const curriculos = await Curriculo.findAll();
			return res.status(200).json(curriculos);
		} catch (error) {
			return res.status(500).json({ error: "Erro ao obter Curriculos!" });
		}
	}
});

router.post("/", verifyIdToken, async (req, res) => {
	try {
		const { name, age, experience, education } = req.body;

		const curriculo = await Curriculo.create({ name, age, experience, education });
		return res.status(201).json(curriculo);
	} catch (error) {
		res.status(500).json({ error: error.message ?? "Erro ao criar o curriculo" });
	}
});

router.delete("/", verifyIdToken, checkAdmin, async (req, res) => {
	try {
		const { id } = req.query;

		const curriculo = await Curriculo.findByPk(id);

		if (!curriculo) {
			return res.status(404).json({ error: "Curriculo não encontrado!" });
		}

		await curriculo.destroy();

		res.status(200).json({ message: "Curriculo excluído com sucesso" });
	} catch (error) {
		res.status(500).json({ error: "Erro ao excluir o curriculo" });
	}
});

router.put("/", verifyIdToken, async (req, res) => {
	try {
		const { id } = req.query;
		const { name, age, experience, education } = req.body;

		const curriculo = await Curriculo.findByPk(id);

		if (!curriculo) {
			return res.status(404).json({ error: "Curriculo não encontrado!" });
		}

		curriculo.name = name ?? curriculo.name;
		curriculo.age = age ?? curriculo.age;
		curriculo.experience = experience ?? curriculo.experience;
		curriculo.education = education ?? curriculo.education;

		await curriculo.save();

		res.status(200).json(curriculo);
	} catch (error) {
		res.status(500).json({ error: error.message ?? "Erro ao atualizar o curriculo" });
	}
});

export default router;
