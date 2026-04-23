import logging

_logger = logging.getLogger(__name__)


def _patch_security_check_session():
    """
    Odoo 19: `odoo.service.security.check_session()` puede llamar `consteq(expected, session.session_token)`
    cuando `session.session_token` es `None`, causando:
      TypeError: unsupported operand types(s) ... 'str' and 'NoneType'

    Workaround: inicializa `session.session_token` usando `session.sid` cuando falte.
    """
    try:
        from odoo.service import security  # type: ignore
    except Exception as e:
        _logger.warning("No se pudo importar odoo.service.security: %s", e)
        return

    if getattr(security, "_billnova_check_session_patched", False):
        return

    original = security.check_session

    def patched_check_session(session, env, request):
        token = getattr(session, "session_token", None)
        if token is None:
            sid = getattr(session, "sid", None)
            try:
                session.session_token = sid or ""
            except Exception:
                # Si el atributo es de solo lectura en esta versión, evitamos el crash
                # devolviendo al check original (que ya no debería crashear si session_token existe).
                pass
        return original(session, env, request)

    security.check_session = patched_check_session
    security._billnova_check_session_patched = True
    _logger.info("Applied billnova patch: security.check_session session_token fallback")


_patch_security_check_session()

