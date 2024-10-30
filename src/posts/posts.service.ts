import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { CreatePostDto, UpdatePostDto } from './dto';
import { slugify } from './utils/slugify';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async getAllPosts(): Promise<Post[]> {
    return this.postModel.find().exec();
  }

  async getPaginatedPosts(
    page = 1,
    limit = 9,
  ): Promise<{ posts: Post[]; totalPages: number }> {
    const skip = (page - 1) * limit;
    const posts = await this.postModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPosts = await this.postModel.countDocuments().exec();
    const totalPages = Math.ceil(totalPosts / limit);
    return { posts, totalPages };
  }

  async searchPostsByTitle(
    title: string,
    page = 1,
    limit = 9,
  ): Promise<{ posts: Post[]; totalPages: number }> {
    const skip = (page - 1) * limit;
    const posts = await this.postModel
      .find({ title: { $regex: title, $options: 'i' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPosts = await this.postModel
      .countDocuments({ title: { $regex: title, $options: 'i' } })
      .exec();
    const totalPages = Math.ceil(totalPosts / limit);

    return { posts, totalPages };
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const post = await this.postModel.findOne({ slug }).exec();
    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }
    return post;
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    return post;
  }

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const slug = slugify(createPostDto.title); // Generate slug from title
    const existingPost = await this.postModel.findOne({ slug }).exec();

    if (existingPost) {
      throw new ConflictException('A post with this title already exists');
    }

    const newPost = new this.postModel({ ...createPostDto, slug });
    return newPost.save();
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const slug = slugify(updatePostDto.title); // Generate slug from title
    if (updatePostDto.title) {
      const existingPostWithSlug = await this.postModel.findOne({ slug });
      if (existingPostWithSlug && existingPostWithSlug._id.toString() !== id) {
        throw new ConflictException(
          `A post with the title "${updatePostDto.title}" already exists`,
        );
      }
    }

    updatePostDto.slug = slug;

    const existingPost = await this.postModel.findByIdAndUpdate(
      id,
      updatePostDto,
      { new: true },
    );
    if (!existingPost) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    return existingPost;
  }

  async deletePost(id: string): Promise<any> {
    const result = await this.postModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    return result;
  }
}
