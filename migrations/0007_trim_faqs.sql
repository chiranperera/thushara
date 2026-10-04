-- Handover trim: every FAQ group keeps at most two real, fully written
-- answers. Thushara adds more himself from /admin/faq.
--
-- 1. Anything without a written answer goes. These were questions the
--    copy left as "pending" — on his worklist, never on the site — and
--    at handover the worklist should be empty rather than full of
--    questions somebody else chose for him.
DELETE FROM faqs WHERE answer IS NULL OR trim(answer) = '';

-- 2. At most two per group. A group is a service page (service set),
--    or a category on the Questions page (service NULL). The first two
--    by sort order stay — the order he sees in the admin.
DELETE FROM faqs WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY coalesce(service, ''), CASE WHEN service IS NULL THEN coalesce(category, '') ELSE '' END
      ORDER BY sort_order, id
    ) AS rn
    FROM faqs
  ) WHERE rn > 2
);
