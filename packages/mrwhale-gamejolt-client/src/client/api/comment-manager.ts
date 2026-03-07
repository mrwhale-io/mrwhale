import { Endpoints } from "../../constants";
import { ApiData } from "../../types/api-data";
import { APIRequestManager } from "./api-request-manager";

/**
 * API manager for Game Jolt comment system operations.
 * 
 * The CommentManager handles all operations related to posting and managing comments
 * on various Game Jolt resources such as games, posts, and other content.
 * 
 * ## Features:
 * - **Comment Creation**: Post comments on various Game Jolt resources
 * - **Content Support**: Support for rich text content in comments
 * - **Resource Targeting**: Comments can be added to different resource types
 * - **Error Handling**: Proper validation and error handling for comment operations
 * 
 * ## Supported Resources:
 * Comments can be added to various Game Jolt resources including:
 * - Games and game pages
 * - Fireside posts and articles
 * - User profiles and activity
 * - Community content
 * 
 * @example
 * ```typescript
 * // Add a comment to a game
 * const success = await client.api.comments.addComment(
 *   12345, // gameId
 *   'Game', // resource type
 *   'This game is awesome! Great work on the graphics.'
 * );
 * 
 * if (success) {
 *   console.log('Comment posted successfully');
 * } else {
 *   console.log('Failed to post comment');
 * }
 * ```
 */
export class CommentManager extends APIRequestManager {
  /**
   * Adds a comment to a specified Game Jolt resource.
   * 
   * Posts a new comment to the specified resource on Game Jolt. Comments are immediately
   * visible to other users and follow Game Jolt's community guidelines.
   * 
   * @param resourceId - The unique identifier of the resource to comment on.
   * @param resource - The type of resource being commented on (e.g., 'Game', 'Fireside_Post', 'User').
   * @param content - The text content of the comment. Supports basic formatting and mentions.
   * @returns A Promise that resolves to `true` if the comment was successfully posted, `false` otherwise.
   * @throws {Error} When the API request fails due to network issues or server errors.
   * 
   * @example
   * ```typescript
   * // Comment on a game
   * try {
   *   const gameCommentSuccess = await commentManager.addComment(
   *     12345,
   *     'Game',
   *     'Amazing gameplay! The pixel art style really brings back memories.'
   *   );
   *   
   *   if (gameCommentSuccess) {
   *     console.log('Game comment posted successfully');
   *   }
   * } catch (error) {
   *   console.error('Failed to post comment:', error);
   * }
   * 
   * // Comment on a fireside post
   * const postCommentSuccess = await commentManager.addComment(
   *   67890,
   *   'Fireside_Post',
   *   'Great article! Thanks for sharing your development insights.'
   * );
   * ```
   * 
   * @remarks
   * - Comments must follow Game Jolt's community guidelines
   * - Empty or whitespace-only content will be rejected
   * - Maximum comment length limits apply (varies by resource type)
   * - Some resources may require special permissions to comment
   * - Comments are immediately visible to other users
   */
  async addComment(
    resourceId: number,
    resource: string,
    content: string,
  ): Promise<boolean> {
    const data = await this.post<ApiData<{ success: boolean }>>(
      Endpoints.comments.save,
      {
        _removed: false,
        isFollowPending: false,
        comment_content: content,
        resource,
        resource_id: resourceId,
      },
    );

    return data.payload?.success || false;
  }
}
