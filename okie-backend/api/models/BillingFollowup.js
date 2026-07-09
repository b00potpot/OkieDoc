module.exports = {

  attributes: {

    billing: {
      model: "billing",
      required: true,
    },

    dateSent: {
      type: "string",
      required: true,
    },

    remarks: {
      type: "string",
      allowNull: true,
    },

    sentBy: {
      type: "string",
      allowNull: true,
    },
  },
};