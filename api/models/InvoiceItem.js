module.exports = (sequelize, DataTypes) => {
  const InvoiceItem = sequelize.define(
    "InvoiceItem",
    {
      invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      serviceName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      price: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },

      category: {
        type: DataTypes.ENUM(
          "consultation",
          "additional",
          "custom"
        ),
      },
    }
  );

  InvoiceItem.associate = (models) => {
    InvoiceItem.belongsTo(models.Invoice, {
      foreignKey: "invoiceId",
    });
  };

  return InvoiceItem;
};