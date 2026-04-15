from odoo import http
from odoo.http import request, Response
import logging
import json

_logger = logging.getLogger(__name__)


class ProductReviewController(http.Controller):

    # ── CORS helpers (mismo patrón que ProductApiController) ─────────────────
    def _cors_headers(self):
        origin = request.httprequest.headers.get('Origin')
        return {
            'Access-Control-Allow-Origin':      origin or '*',
            'Access-Control-Allow-Methods':     'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers':     'Content-Type, Authorization, Accept, Origin',
            'Access-Control-Allow-Credentials': 'true',
        }

    def _json_response(self, data, status=200):
        return Response(
            json.dumps(data),
            status=status,
            headers=self._cors_headers(),
            content_type='application/json',
        )

    def _options_response(self):
        return Response('', status=200, headers=self._cors_headers())

    # ── POST /api/products/<id>/reviews ──────────────────────────────────────
    @http.route(
        '/api/products/<int:product_id>/reviews',
        type='http',
        auth='public',
        methods=['POST', 'OPTIONS'],
        csrf=False,
    )
    def create_review(self, product_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        _logger.info("POST review product_id=%s kwargs=%s", product_id, kwargs)

        comment    = (kwargs.get('comment') or '').strip()
        rating_raw = kwargs.get('rating')

        errors = {}
        if not comment:
            errors['comment'] = 'Comment is required.'
        try:
            rating = float(rating_raw)
            if not (1 <= rating <= 5):
                raise ValueError
        except (TypeError, ValueError):
            errors['rating'] = 'Rating must be a number between 1 and 5.'

        if errors:
            return self._json_response({'ok': False, 'error': errors}, 400)

        product = request.env['product.product'].sudo().browse(product_id)
        if not product.exists():
            return self._json_response({'ok': False, 'error': 'Product not found.'}, 404)

        partner = request.env.user.partner_id

        # 1. rating.rating
        model_obj     = request.env['ir.model'].sudo()._get('product.product')
        rating_record = request.env['rating.rating'].sudo().create({
            'res_model_id':    model_obj.id,
            'res_id':          product_id,
            'rated_partner_id': partner.id,
            'rating':          rating,
        })

        # 2. mail.message
        message = request.env['mail.message'].sudo().create({
            'model':        'product.product',
            'res_id':       product_id,
            'body':         comment,
            'message_type': 'comment',
            'author_id':    partner.id,
        })

        _logger.info("Review created: message=%s rating=%s", message.id, rating_record.id)

        return self._json_response({
            'ok': True,
            'review': {
                'review_id': message.id,
                'rating_id': rating_record.id,
                'author':    partner.name or 'Anonymous',
                'rating':    rating,
                'comment':   comment,
                'date':      message.create_date.strftime('%b %d, %Y') if message.create_date else '',
            },
            'stats': _get_stats(product_id),
        }, 201)

    # ── GET /api/products/<id>/reviews ────────────────────────────────────────
    @http.route(
        '/api/products/<int:product_id>/reviews',
        type='http',
        auth='public',
        methods=['GET', 'OPTIONS'],
        csrf=False,
    )
    def get_product_reviews(self, product_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        _logger.info("GET reviews product_id=%s", product_id)

        limit  = _safe_int(kwargs.get('limit'),  default=20, max_val=100)
        offset = _safe_int(kwargs.get('offset'), default=0)

        messages = request.env['mail.message'].sudo().search([
            ('model',        '=', 'product.product'),
            ('res_id',       '=', product_id),
            ('message_type', '=', 'comment'),
        ], order='create_date desc', limit=limit, offset=offset)

        total = request.env['mail.message'].sudo().search_count([
            ('model',        '=', 'product.product'),
            ('res_id',       '=', product_id),
            ('message_type', '=', 'comment'),
        ])

        # índice rating por partner
        ratings = request.env['rating.rating'].sudo().search([
            ('res_model', '=', 'product.product'),
            ('res_id',    '=', product_id),
        ])
        rating_by_partner = {}
        for r in ratings:
            pid = r.rated_partner_id.id
            if pid not in rating_by_partner:
                rating_by_partner[pid] = r.rating

        reviews = [{
            'review_id': m.id,
            'author':    m.author_id.name or 'Anonymous',
            'rating':    rating_by_partner.get(m.author_id.id, 0),
            'comment':   m.body or '',
            'date':      m.create_date.strftime('%b %d, %Y') if m.create_date else '',
        } for m in messages]

        return self._json_response({
            'ok':            True,
            'product_id':    product_id,
            'total_reviews': total,
            'stats':         _get_stats(product_id),
            'reviews':       reviews,
        })

    # ── GET /api/products/<id>/rating  (compatibilidad con controller original)
    @http.route(
        '/api/products/<int:product_id>/rating',
        type='http',
        auth='public',
        methods=['GET', 'OPTIONS'],
        csrf=False,
    )
    def get_product_rating(self, product_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        stats = _get_stats(product_id)
        return self._json_response({
            'ok':             True,
            'product_id':     product_id,
            'average_rating': stats['avg'],
            'total_ratings':  stats['total'],
        })

    # ── POST /api/products/<id>/rating  (compatibilidad con controller original)
    @http.route(
        '/api/products/<int:product_id>/rating',
        type='http',
        auth='public',
        methods=['POST', 'OPTIONS'],
        csrf=False,
    )
    def create_rating(self, product_id, **kwargs):
        if request.httprequest.method == 'OPTIONS':
            return self._options_response()

        _logger.info("POST rating product_id=%s kwargs=%s", product_id, kwargs)

        try:
            rating = float(kwargs.get('rating'))
            if not (0 <= rating <= 5):
                raise ValueError
        except (TypeError, ValueError):
            return self._json_response(
                {'ok': False, 'error': 'Rating must be a number between 0 and 5'}, 400
            )

        model_obj     = request.env['ir.model'].sudo()._get('product.product')
        rating_record = request.env['rating.rating'].sudo().create({
            'res_model_id':    model_obj.id,
            'res_id':          product_id,
            'rated_partner_id': request.env.user.partner_id.id,
            'rating':          rating,
        })

        return self._json_response({'ok': True, 'rating_id': rating_record.id}, 201)


# ── helpers ───────────────────────────────────────────────────────────────────
def _get_stats(product_id: int) -> dict:
    ratings = request.env['rating.rating'].sudo().search([
        ('res_model', '=', 'product.product'),
        ('res_id',    '=', product_id),
    ])
    total = len(ratings)
    avg   = round(sum(r.rating for r in ratings) / total, 1) if total else 0.0

    dist = {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0}
    for r in ratings:
        key = str(min(5, max(1, round(r.rating))))
        dist[key] += 1

    return {'avg': avg, 'total': total, 'distribution': dist}


def _safe_int(value, default=0, max_val=None):
    try:
        v = int(value)
        if max_val is not None:
            v = min(v, max_val)
        return max(v, 0)
    except (TypeError, ValueError):
        return default