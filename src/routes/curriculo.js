import { Router } from "express";
import Curriculo from "../models/curriculo";

const router = Router();

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

router.post("/", async (req, res) => {
	try {
		const { name, age, experience, education } = req.body;

		const curriculo = await Curriculo.create({ name, age, experience, education });
		return res.status(201).json(curriculo);
	} catch (error) {
		res.status(500).json({ error: error.message ?? "Erro ao criar o curriculo" });
	}
});

router.delete("/", async (req, res) => {
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

router.put("/", async (req, res) => {
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
