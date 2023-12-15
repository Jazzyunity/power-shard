const { where } = require("sequelize");
const asyncHandler = require("../middlewares/asyncHandler");
const Event = require("../models/events");
const User = require("../models/User");
const ErrorResponse = require("../util/errorResponse");
const slugify = require("slugify");

const {
  appendFollowers,
  appendFavorites,
} = require("../util/helpers");

const includeOptions = [
  { model: User, as: "author", attributes: { exclude: ["email", "password"] } },
];

module.exports.getEvent = asyncHandler(async (req, res, next) => {
  const { author, favorited, limit = 20, offset = 0 } = req.query;
  const { loggedUser } = req;

  const searchOptions = {
    include: [
      {
        model: User,
        as: "author",
        attributes: { exclude: ["password", "email"] },
        // where: author ? { username: author } : {},
        ...(author && { where: { username: author } }),
      },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
    distinct: true,
  };

  let events = { rows: [], count: 0 };

  if (favorited) {
    const user = await User.findOne({ where: { username: favorited } });

    events.rows = await user.getFavorites(searchOptions);
    events.count = await user.countFavorites();
  } else {
    events = await Event.findAndCountAll(searchOptions);
  }

  for (let event of events.rows) {
    await appendFollowers(loggedUser, event);
    await appendFavorites(loggedUser, event);

    delete event.dataValues.Favorites;
  }

  res
    .status(200)
    .json({ events: events.rows, articlesCount: events.count });
});

module.exports.createEvent = asyncHandler(async (req, res, next) => {
  const { loggedUser } = req;

  fieldValidation(req.body.event.title, next);
  fieldValidation(req.body.event.description, next);
  fieldValidation(req.body.event.body, next);

  const { title, description, body } = req.body.event;
  const slug = slugify(title, { lower: true });
  const slugInDB = await Event.findOne({ where: { slug: slug } });
  if (slugInDB) next(new ErrorResponse("Title already exists", 400));

  const event = await Event.create({
    title: title,
    description: description,
    body: body,
  });

  delete loggedUser.dataValues.token;

  event.setAuthor(loggedUser);
  event.dataValues.author = loggedUser;
  await appendFollowers(loggedUser, loggedUser);
  await appendFavorites(loggedUser, event);

  res.status(201).json({ event });
});

module.exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const { loggedUser } = req;

  const event = await Event.findOne({
    where: { slug: slug },
    include: includeOptions,
  });

  if (!event) next(new ErrorResponse("Event not found", 404));

  if (event.authorId !== loggedUser.id)
    return next(new ErrorResponse("Unauthorized", 401));

  await event.destroy();

  res.status(200).json({ event });
});

module.exports.updateEvent = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const { loggedUser } = req;

  const event = await Event.findOne({
    where: { slug: slug },
    include: includeOptions,
  });

  if (!event) next(new ErrorResponse("Event not found", 404));

  if (event.authorId !== loggedUser.id)
    return next(new ErrorResponse("Unauthorized", 401));

  const { title, description, body } = req.body.event;

  const slugInDB = await Event.findOne({
    where: { slug: slugify(title ? title : event.title, { lower: true }) },
  });

  if (slugInDB && slugInDB.slug !== slug)
    return next(new ErrorResponse("Title already exists", 400));

  await event.update({
    title: title ? title : event.title,
    description: description ? description : event.description,
    body: body ? body : event.body,
  });

  await appendFollowers(loggedUser, event);
  await appendFavorites(loggedUser, event);

  res.status(200).json({ event });
});

module.exports.eventsFeed = asyncHandler(async (req, res, next) => {
  const { loggedUser } = req;

  const { limit = 3, offset = 0 } = req.query;
  const authors = await loggedUser.getFollowing();

  const events = await Event.findAndCountAll({
    include: includeOptions,
    limit: parseInt(limit),
    offset: offset * limit,
    order: [["createdAt", "DESC"]],
    where: { authorId: authors.map((author) => author.id) },
    distinct: true,
  });

  for (const event of events.rows) {
    await appendFollowers(loggedUser, event);
    await appendFavorites(loggedUser, event);
  }

  res.json({ events: events.rows, articlesCount: events.count });
});

module.exports.getEvent = asyncHandler(async (req, res, next) => {
  const { loggedUser } = req;
  const { slug } = req.params;

  const event = await Event.findOne({
    where: { slug: slug },
    include: includeOptions,
  });

  if (!event) return next(new ErrorResponse("Event not found", 404));
  ;
  await appendFollowers(loggedUser, event);
  await appendFavorites(loggedUser, event);

  res.status(200).json({ event });
});

module.exports.addFavoriteEvent = asyncHandler(async (req, res, next) => {
  const { loggedUser } = req;
  const { slug } = req.params;

  const event = await Event.findOne({
    where: { slug: slug },
    include: includeOptions,
  });

  if (!event) return next(new ErrorResponse("Event not found", 404));

  await loggedUser.addFavorite(event);

  await appendFollowers(loggedUser, event);
  await appendFavorites(loggedUser, event);

  res.status(200).json({ event });
});

module.exports.deleteFavoriteEvent = asyncHandler(async (req, res, next) => {
  const { loggedUser } = req;
  const { slug } = req.params;

  const event = await Event.findOne({
    where: { slug: slug },
    include: includeOptions,
  });

  if (!event) return next(new ErrorResponse("Event not found", 404));

  await loggedUser.removeFavorite(event);

  await appendFollowers(loggedUser, event);
  await appendFavorites(loggedUser, event);

  res.status(200).json({ event });
});

const fieldValidation = (field, next) => {
  if (!field) {
    return next(new ErrorResponse(`Missing fields`, 400));
  }
};
