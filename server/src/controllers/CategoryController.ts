import { Request, Response } from 'express';
import { Knex } from 'knex';
import CategoryModel from '../models/Category';
import type { CreateCategoryData, UpdateCategoryData } from '../models/model-types';
import { logger } from '../config/LoggerConfig';

class CategoryController {
  private categoryModel: CategoryModel;

  constructor(database: Knex) {
    this.categoryModel = new CategoryModel(database);
  }

  // GET /api/categories - Get all categories
  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const includeEventCount = req.query.include_event_count === 'true';
      
      let categories;
      if (includeEventCount) {
        categories = await this.categoryModel.getAllWithEventCounts();
      } else {
        categories = await this.categoryModel.getAll();
      }

      res.json({
        success: true,
        data: { categories },
        message: 'Categories retrieved successfully'
      });
    } catch (error: any) {
      logger.error(`Error getting categories: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve categories'
      });
    }
  };

  // GET /api/categories/:id - Get category by ID
  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id!);
      
      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid category ID'
        });
        return;
      }

      const includeEventCount = req.query.include_event_count === 'true';
      
      let category;
      if (includeEventCount) {
        category = await this.categoryModel.getCategoryWithEventCount(categoryId);
      } else {
        category = await this.categoryModel.getById(categoryId);
      }
      
      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { category },
        message: 'Category retrieved successfully'
      });
    } catch (error: any) {
      logger.error(`Error getting category: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve category'
      });
    }
  };

  // POST /api/categories - Create new category
  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description }: CreateCategoryData = req.body;

      // Validation
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Category name is required and must be a non-empty string'
        });
        return;
      }

      if (name.trim().length > 100) {
        res.status(400).json({
          success: false,
          error: 'Category name must be 100 characters or less'
        });
        return;
      }

      // Check if category with same name already exists
      const existingCategory = await this.categoryModel.getByName(name.trim());
      if (existingCategory) {
        res.status(409).json({
          success: false,
          error: 'A category with this name already exists'
        });
        return;
      }

      const categoryData: CreateCategoryData = {
        name: name.trim(),
        ...(description?.trim() && { description: description.trim() })
      };

      const category = await this.categoryModel.create(categoryData);

      res.status(201).json({
        success: true,
        data: { category },
        message: 'Category created successfully'
      });
    } catch (error: any) {
      logger.error(`Error creating category: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to create category'
      });
    }
  };

  // PUT /api/categories/:id - Update category
  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id!);
      const { name, description }: UpdateCategoryData = req.body;

      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid category ID'
        });
        return;
      }

      // Check if category exists
      const existingCategory = await this.categoryModel.getById(categoryId);
      if (!existingCategory) {
        res.status(404).json({
          success: false,
          error: 'Category not found'
        });
        return;
      }

      // Validation
      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          res.status(400).json({
            success: false,
            error: 'Category name must be a non-empty string'
          });
          return;
        }

        if (name.trim().length > 100) {
          res.status(400).json({
            success: false,
            error: 'Category name must be 100 characters or less'
          });
          return;
        }

        // Check if another category with same name exists
        const duplicateCategory = await this.categoryModel.getByName(name.trim());
        if (duplicateCategory && duplicateCategory.id !== categoryId) {
          res.status(409).json({
            success: false,
            error: 'A category with this name already exists'
          });
          return;
        }
      }

      const updateData: UpdateCategoryData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) {
        if (description.trim()) {
          updateData.description = description.trim();
        }
      }

      const updatedCategory = await this.categoryModel.update(categoryId, updateData);

      res.json({
        success: true,
        data: { category: updatedCategory },
        message: 'Category updated successfully'
      });
    } catch (error: any) {
      logger.error(`Error updating category: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to update category'
      });
    }
  };

  // DELETE /api/categories/:id - Delete category
  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id!);

      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid category ID'
        });
        return;
      }

      // Check if category exists
      const existingCategory = await this.categoryModel.getById(categoryId);
      if (!existingCategory) {
        res.status(404).json({
          success: false,
          error: 'Category not found'
        });
        return;
      }

      // Check if category has events (optional - you might want to allow deletion)
      const eventsInCategory = await this.categoryModel.getEventsInCategory(categoryId);
      if (eventsInCategory.length > 0) {
        res.status(409).json({
          success: false,
          error: `Cannot delete category. ${eventsInCategory.length} event(s) are using this category. Please reassign or delete these events first.`
        });
        return;
      }

      const deleted = await this.categoryModel.delete(categoryId);

      if (!deleted) {
        res.status(500).json({
          success: false,
          error: 'Failed to delete category'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error: any) {
      logger.error(`Error deleting category: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to delete category'
      });
    }
  };

  // GET /api/categories/:id/events - Get events in this category
  getCategoryEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id!);

      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid category ID'
        });
        return;
      }

      // Check if category exists
      const category = await this.categoryModel.getById(categoryId);
      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found'
        });
        return;
      }

      const eventIds = await this.categoryModel.getEventsInCategory(categoryId);

      res.json({
        success: true,
        data: { category, eventIds },
        message: 'Category events retrieved successfully'
      });
    } catch (error: any) {
      logger.error(`Error getting category events: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve category events'
      });
    }
  };
}

export default CategoryController;