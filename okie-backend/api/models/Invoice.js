module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define("Invoice", {
    consultationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    paymentType: {
      type: DataTypes.ENUM(
        "Private",
        "HMO",
        "PhilHealth",
        "Yakap"
      ),
      defaultValue: "Private",
    },

    paymentStatus: {
      type: DataTypes.ENUM(
        "Pending",
        "Partial",
        "Paid"
      ),
      defaultValue: "Pending",
    },

    consultationFee: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    subtotal: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    finalTotal: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  });

  Invoice.associate = (models) => {
    Invoice.hasMany(models.InvoiceItem, {
      foreignKey: "invoiceId",
    });

    Invoice.hasMany(models.InvoiceHistory, {
      foreignKey: "invoiceId",
    });
  };

  return Invoice;
};