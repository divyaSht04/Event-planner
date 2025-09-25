import { Request, Response } from 'express';
import { Knex } from 'knex';
import TagModel from '../models/Tag';
import type { CreateTagData, UpdateTagData } from '../models/model-types';
import { logger } from '../config/LoggerConfig';

class TagController {
  private tagModel: TagModel;

  constructor(database: Knex) {
    this.tagModel = new TagModel(database);
  }

  // GET /api/tags - Get all tags
  getAllTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const tags = await this.tagModel.getAll();
      res.json({
        success: true,
        data: { tags },
        message: 'Tags retrieved successfully'
      });
    } catch (error: any) {
      logger.error(`Error getting tags: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve tags'
      });
    }
  };

  // GET /api/tags/:id - Get tag by ID
  getTagById = async (req: Request, res: Response): Promise<void> => {
    try {
      const tagId = parseInt(req.params.id!);
      
      if (isNaN(tagId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid tag ID'
        });
        return;
      }

      const tag = await this.tagModel.getById(tagId);
      
      if (!tag) {
        res.status(404).json({
          success: false,
          error: 'Tag not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { tag },
        message: 'Tag retrieved successfully'
      });
    } catch (error: any) {
      logger.error(`Error getting tag: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve tag'
      });
    }
  };

  // POST /api/tags - Create new tag
  createTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description }: CreateTagData = req.body;

      // Validation
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Tag name is required and must be a non-empty string'
        });
        return;
      }

      if (name.trim().length > 50) {
        res.status(400).json({
          success: false,
          error: 'Tag name must be 50 characters or less'
        });
        return;
      }

      // Check if tag with same name already exists
      const existingTag = await this.tagModel.getByName(name.trim());
      if (existingTag) {
        res.status(409).json({
          success: false,
          error: 'A tag with this name already exists'
        });
        return;
      }

      const tagData: CreateTagData = {
        name: name.trim(),
        ...(description?.trim() && { description: description.trim() })
      };

      const tag = await this.tagModel.create(tagData);

      res.status(201).json({
        success: true,
        data: { tag },
        message: 'Tag created successfully'
      });
    } catch (error: any) {
      logger.error(`Error creating tag: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to create tag'
      });
    }
  };

  // PUT /api/tags/:id - Update tag
  updateTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const tagId = parseInt(req.params.id!);
      const { name, description }: UpdateTagData = req.body;

      if (isNaN(tagId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid tag ID'
        });
        return;
      }

      // Check if tag exists
      const existingTag = await this.tagModel.getById(tagId);
      if (!existingTag) {
        res.status(404).json({
          success: false,
          error: 'Tag not found'
        });
        return;
      }

      // Validation
      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          res.status(400).json({
            success: false,
            error: 'Tag name must be a non-empty string'
          });
          return;
        }

        if (name.trim().length > 50) {
          res.status(400).json({
            success: false,
            error: 'Tag name must be 50 characters or less'
          });
          return;
        }

        // Check if another tag with same name exists
        const duplicateTag = await this.tagModel.getByName(name.trim());
        if (duplicateTag && duplicateTag.id !== tagId) {
          res.status(409).json({
            success: false,
            error: 'A tag with this name already exists'
          });
          return;
        }
      }

      const updateData: UpdateTagData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) {
        if (description.trim()) {
          updateData.description = description.trim();
        }
      }

      const updatedTag = await this.tagModel.update(tagId, updateData);

      res.json({
        success: true,
        data: { tag: updatedTag },
        message: 'Tag updated successfully'
      });
    } catch (error: any) {
      logger.error(`Error updating tag: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to update tag'
      });
    }
  };

  // DELETE /api/tags/:id - Delete tag
  deleteTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const tagId = parseInt(req.params.id!);

      if (isNaN(tagId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid tag ID'
        });
        return;
      }

      // Check if tag exists
      const existingTag = await this.tagModel.getById(tagId);
      if (!existingTag) {
        res.status(404).json({
          success: false,
          error: 'Tag not found'
        });
        return;
      }

      const deleted = await this.tagModel.delete(tagId);

      if (!deleted) {
        res.status(500).json({
          success: false,
          error: 'Failed to delete tag'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Tag deleted successfully'
      });
    } catch (error: any) {
      logger.error(`Error deleting tag: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to delete tag'
      });
    }
  };

  // GET /api/tags/:id/events - Get events with this tag
  getTagEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const tagId = parseInt(req.params.id!);

      if (isNaN(tagId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid tag ID'
        });
        return;
      }

      // Check if tag exists
      const tag = await this.tagModel.getById(tagId);
      if (!tag) {
        res.status(404).json({
          success: false,
          error: 'Tag not found'
        });
        return;
      }

      const eventIds = await this.tagModel.getEventsWithTag(tagId);

      res.json({
        success: true,
        data: { tag, eventIds },
        message: 'Tag events retrieved successfully'
      });
    } catch (error: any) {
      logger.error(`Error getting tag events: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve tag events'
      });
    }
  };
}

export default TagController;