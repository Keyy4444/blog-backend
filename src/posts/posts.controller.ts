import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import axios from 'axios';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  private async triggerRevalidation() {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/revalidate`, {
        tags: ['posts'],
      });
    } catch (error) {
      console.error('Error triggering revalidation:', error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'Returns an array of all posts' })
  getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Get('/pagination')
  @ApiOperation({ summary: 'Get paginated posts' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of posts and number of total pages',
  })
  getPaginatedPosts(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.postsService.getPaginatedPosts(page, limit);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search posts by title' })
  @ApiQuery({ name: 'title', description: 'Title to search for' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns paginated posts matching the search query and a number of total pages',
  })
  searchPostsByTitle(
    @Query('title') title: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.postsService.searchPostsByTitle(title, page, limit);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get post by slug' })
  @ApiParam({ name: 'slug', description: 'Slug of the post' })
  @ApiResponse({ status: 200, description: 'Returns a single post by slug' })
  getPostBySlug(@Param('slug') slug: string) {
    return this.postsService.getPostBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', description: 'ID of the post' })
  @ApiResponse({ status: 200, description: 'Returns a single post by ID' })
  getPostById(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'The post has been created' })
  async createPost(@Body() createPostDto: CreatePostDto) {
    const post = await this.postsService.createPost(createPostDto);
    await this.triggerRevalidation();
    return post;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', description: 'ID of the post' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'The post has been updated' })
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const post = await this.postsService.updatePost(id, updatePostDto);
    await this.triggerRevalidation();
    return post;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', description: 'ID of the post' })
  @ApiResponse({ status: 200, description: 'The post has been deleted' })
  async deletePost(@Param('id') id: string) {
    const result = await this.postsService.deletePost(id);
    await this.triggerRevalidation();
    return result;
  }
}
