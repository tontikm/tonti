-- Link orphaned events to organizers when contact_email matches account email.
update events e
set organizer_id = o.id
from organizers o
where e.organizer_id is null
  and e.contact_email is not null
  and lower(e.contact_email) = lower(o.email);
