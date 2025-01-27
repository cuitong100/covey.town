import express, { Express } from 'express';
import io from 'socket.io';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import {
  conversationAreaCreateHandler,
  townCreateHandler, townDeleteHandler,
  townJoinHandler,
  townListHandler,
  townSubscriptionHandler,
  townUpdateHandler,
} from '../requestHandlers/CoveyTownRequestHandlers';
import { logError } from '../Utils';
import verifyJWT from '../middleware/verifyJWT';
import Town from '../models/town';
import User from '../models/user';


export default function addTownRoutes(http: Server, app: Express): io.Server {
  /*
   * Create a new session (aka join a town)
   */
  app.post('/sessions', express.json(), verifyJWT, async (req, res) => {
    try {
      const result = await townJoinHandler({
        userName: req.body.userName,
        coveyTownID: req.body.coveyTownID,
      });
      if (result.isOK) {
        await User.updateOne(
          { username: req.body.accountUsername },
          { $set: {
            lastVisitedTownId: req.body.coveyTownID,
          } },
        );
      }
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
   * Delete a town
   */
  app.delete('/towns/:townID/:townPassword', express.json(), verifyJWT, async (req, res) => {
    try {
      const result = townDeleteHandler({
        coveyTownID: req.params.townID,
        coveyTownPassword: req.params.townPassword,
      });

      // Delete database if townDeleteHandler is successful
      if (result.isOK) {
        await Town.deleteOne(
          { coveyTownId: req.params.townID });
      }
      res.status(200)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(500)
        .json({
          message: 'Internal server error, please see log in server for details',
        });
    }
  });

  /**
   * List all towns
   */
  app.get('/towns', express.json(), verifyJWT, async (_req, res) => {
    try {
      const result = townListHandler();
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
   * Create a town
   */
  app.post('/towns', express.json(), verifyJWT, async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      // if username exists, create a new town
      if (user) {
        const result = townCreateHandler(req.body);
        // assign the newly created town with user id
        const newTown = new Town({
          coveyTownId: result.response?.coveyTownID,
          userId: user._id,
          townUpdatePassword: result.response?.coveyTownPassword,
          isPublic: req.body.isPubliclyListed,
          friendlyName: req.body.friendlyName,
          capacity: 20,
        });
        // save town and respond
        await newTown.save();
        res.status(StatusCodes.OK)
          .json(result);

      } else {
        res.status(404).json('Cannot create town because user not found');
      }
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });
  /**
   * Update a town
   */
  app.patch('/towns/:townID', express.json(), verifyJWT, async (req, res) => {
    try {
      const result = townUpdateHandler({
        coveyTownID: req.params.townID,
        isPubliclyListed: req.body.isPubliclyListed,
        friendlyName: req.body.friendlyName,
        coveyTownPassword: req.body.coveyTownPassword,
      });

      // Update database if townUpdateHandler is successful
      if (result.isOK) {
        await Town.updateOne(
          { coveyTownId: req.params.townID },
          {
            $set: {
              townUpdatePassword: req.body.coveyTownPassword,
              isPublic: req.body.isPubliclyListed,
              friendlyName: req.body.friendlyName,
            },
          });
      }
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  app.post('/towns/:townID/conversationAreas', express.json(), verifyJWT, async (req, res) => {
    try {
      const result = conversationAreaCreateHandler({
        coveyTownID: req.params.townID,
        sessionToken: req.body.sessionToken,
        conversationArea: req.body.conversationArea,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', townSubscriptionHandler);
  return socketServer;
}
