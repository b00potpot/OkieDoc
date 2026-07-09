module.exports = (sequelize, DataTypes) => {
  const InvoiceHistory = sequelize.define(
    "InvoiceHistory",
    {
      invoiceId: DataTypes.INTEGER,

      action: DataTypes.STRING,

      performedBy: DataTypes.INTEGER,

      notes: DataTypes.TEXT,
    }
  );

  InvoiceHistory.associate = (models) => {
    InvoiceHistory.belongsTo(models.Invoice, {
      foreignKey: "invoiceId",
    });
  };

  return InvoiceHistory;
};