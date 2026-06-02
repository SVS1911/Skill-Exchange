from flask import Blueprint
from flask import request

from services.searchservice import (
    search_marketplace
)

search_bp = Blueprint(
    "search",
    __name__
)


@search_bp.route(
    "/",
    methods=["GET"]
)
def search():
    """
    Search Marketplace
    ---
    tags:
      - Search

    summary: Search users and skills in marketplace

    description: >
      Search marketplace by skill name, user name,
      and sort results.

    parameters:
      - name: skill
        in: query
        type: string
        required: false
        description: Skill name to search
        example: Python

      - name: user
        in: query
        type: string
        required: false
        description: Username to search
        example: Sai

      - name: sort
        in: query
        type: string
        required: false
        description: Sort results
        enum:
          - points
          - rating
        example: rating

    responses:
      200:
        description: Search results fetched successfully
        schema:
          type: array
          items:
            type: object
            properties:
              user_id:
                type: integer
                example: 1

              name:
                type: string
                example: Sai

              skill:
                type: string
                example: Python

              role:
                type: string
                example: Mentor

              points:
                type: integer
                example: 150

              average_rating:
                type: number
                example: 4.8

      404:
        description: No matching users or skills found
    """
    skill = request.args.get(
        "skill"
    )

    user = request.args.get(
        "user"
    )

    sort = request.args.get(
        "sort"
    )

    return search_marketplace(
        skill,
        user,
        sort
    )