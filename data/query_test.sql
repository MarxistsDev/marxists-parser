select count(*) from Author a 
join Author_Work aw on a.author_id = aw.author_id 
join Work w on aw.work_id = w.work_id 
join Article art on w.work_id = art.work_id 
where a.name like '%Lenin%';