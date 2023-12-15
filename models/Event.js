const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");
const slugify = require("slugify");

const Event = sequelize.define("Event", {
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Event.beforeValidate((event) => {
  event.slug = slugify(event.title, { lower: true });
});

module.exports = Event;
