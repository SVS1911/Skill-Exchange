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