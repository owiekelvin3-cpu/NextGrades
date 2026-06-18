-- Restrict auth email lookup RPC to service_role only (blocks anon/authenticated enumeration).

REVOKE EXECUTE ON FUNCTION public.auth_user_id_by_email(text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_id_by_email(text) TO service_role;
