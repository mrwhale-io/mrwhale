import { Endpoints } from "../../constants";
import { ApiData } from "../../types/api-data";
import { APIRequestManager } from "./api-request-manager";

/**
 * API request manager for comments.
 */
export class CommentManager extends APIRequestManager {
  /**
   * Adds a comment to a resource.
   * @param resourceId The identifier of the resource to add the comment to.
   * @param resource The type of resource to add the comment to.
   * @param content The content of the comment.
   * @returns A boolean indicating whether the comment was successfully added.
   */
  async addComment(
    resourceId: number,
    resource: string,
    content: string
  ): Promise<boolean> {
    const data = await this.post<ApiData<{ success: boolean }>>(
      Endpoints.comments_save,
      {
        _removed: false,
        isFollowPending: false,
        comment_content: content,
        resource,
        resource_id: resourceId,
      }
    );

    return data.payload?.success || false;
  }
}
