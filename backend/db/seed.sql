insert into items (title)
select 'Welcome to the starter'
where not exists (select 1 from items);

insert into items (title)
select 'Add an item below'
where (select count(*) from items) < 2;
