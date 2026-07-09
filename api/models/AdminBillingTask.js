module.exports = {

  attributes: {

    billing: {
      model: "billing",
      required: true,
    },

    reason: {
      type: "string",
      required: true,
    },

    assignedTo: {
      type: "string",
      allowNull: true,
    },

    status: {
      type: "string",
      defaultsTo: "Open",
    },
  },
};