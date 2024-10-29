import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'My First Post',
    description: 'The title of the post',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  slug?: string;

  @ApiProperty({
    example: 'An introduction to my first post',
    description: 'A short description of the post',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Detailed content of the post',
    description: 'The main content of the post in WYSIWYG format',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'https://example.com/banner.jpg',
    description: 'URL of the banner image for the post',
  })
  @IsString()
  bannerImage: string;
}
