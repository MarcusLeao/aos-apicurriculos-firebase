import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Curriculo = sequelize.define("Curriculo", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			notEmpty: true,
		},
	},
	age: {
		type: DataTypes.INTEGER,
		allowNull: false,
		validate: {
			isValidAge(value) {
				const age = value;
				if (age < 18 || age > 100) {
					throw new Error("A sua idade deve ser válida");
				}
			},
		},
	},
	experience: {
		type: DataTypes.STRING(1234),
		allowNull: true,
	},
	education: {
		type: DataTypes.STRING(1234),
		allowNull: true,
	},
});

export default Curriculo;
