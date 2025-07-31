-- Update driver status to approved for specific drivers
UPDATE public.fahrer_profile 
SET status = 'approved' 
WHERE email IN ('giuseppe.inga@web.de', 'bernd.ungerer@gmx.de');