CREATE TABLE users (
	ID int GENERATED ALWAYS AS IDENTITY,
	PRIMARY KEY(ID)
);

CREATE TABLE authors (
	ID int GENERATED ALWAYS AS IDENTITY,
	name varchar(255) NOT NULL,
	PRIMARY KEY(ID)
);

CREATE TABLE publishers (
	ID int GENERATED ALWAYS AS IDENTITY,
	name varchar(255) NOT NULL,
	PRIMARY KEY(ID)
);

CREATE TABLE book_temps (
	ISBN char(13) primary key NOT NULL,
	author_id int,
	publisher_id int,
	title varchar(255) NOT NULL,
	FOREIGN KEY (author_id) REFERENCES authors(ID),
	FOREIGN KEY (publisher_id) REFERENCES publishers(ID)
);

CREATE TABLE books (
	ID int GENERATED ALWAYS AS IDENTITY,
	ISBN char(13) not NULL,
	user_id int,
	FOREIGN KEY (user_id) REFERENCES users(ID),
	FOREIGN KEY (ISBN) REFERENCES book_temps(ISBN)
);