const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Job = sequelize.define(
    "Job",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      salary: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      postedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      jobType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      experience: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true, // This will add createdAt and updatedAt fields
      indexes: [
        {
          unique: true,
          fields: ["url"],
        },
        {
          fields: ["title"],
        },
        {
          fields: ["company"],
        },
        {
          fields: ["source"],
        },
      ],
    }
  );

  return Job;
};
