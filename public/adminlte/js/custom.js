$(document).ready(function () {
    //check selectbox
    change_form_action("#zt-form .slbAction", "#zt-form", "#btn-action");

    $('#check-all').click(function () {
        $('input:checkbox').not(this).prop('checked', this.checked);
        if ($(this).is(':checked')) {
            $(".ordering").attr("name", "ordering");
        } else {

            $(".ordering").removeAttr("name");
        }

    });

    if ($('textarea#content_ck').length) {
        CKEDITOR.replace('content_ck');
    }

    function change_form_action(slb_selector, form_selector, id_btn_action) {

        var optValue;
        var isDelete = false;
        var pattenCheckDelete = new RegExp("delete", "i");

        $(slb_selector).on("change", function () {
            optValue = $(this).val();

            if (optValue !== "") {
                $(id_btn_action).removeAttr('disabled');
            } else {
                $(id_btn_action).attr('disabled', 'disabled');
            }
            $(form_selector).attr("action", optValue);
        });

        $(form_selector + " .btnAction").on("click", function () {
            isDelete = pattenCheckDelete.test($(slb_selector).val());
            if (isDelete) {
                var confirmDelete = confirm('Are you really want to delete?');
                if (confirmDelete === false) {
                    return;
                }
            }

            var numberOfChecked = $(form_selector + ' input[name="cid"]:checked').length;
            if (numberOfChecked == 0) {
                alert("Please choose some items");
                return;
            } else {
                var flag = false;
                var str = $(slb_selector + " option:selected").attr('data-comfirm');

                if (str != undefined) {

                    //Kiểm tra giá trị trả về khi user nhấn nút trên popup
                    flag = confirm(str);
                    if (flag == false) {
                        return flag;
                    } else {
                        $(form_selector).submit();
                    }

                } else {
                    if (optValue != undefined) {
                        $(form_selector).submit();
                    }
                }
            }

        });
    }

    // convert to slug
    const convertToSlug = function (str) {
        let slug

        //Đổi chữ hoa thành chữ thường
        slug = str.toLowerCase()

        //Đổi ký tự có dấu thành không dấu
        slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
        slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
        slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
        slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
        slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
        slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
        slug = slug.replace(/đ/gi, 'd')
        //Xóa các ký tự đặt biệt
        slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\|_/gi, '')
        //Đổi khoảng trắng thành ký tự gạch ngang
        slug = slug.replace(/ /gi, "-")
        //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
        //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
        slug = slug.replace(/\-\-\-\-\-/gi, '-')
        slug = slug.replace(/\-\-\-\-/gi, '-')
        slug = slug.replace(/\-\-\-/gi, '-')
        slug = slug.replace(/\-\-/gi, '-')
        //Xóa các ký tự gạch ngang ở đầu và cuối
        slug = '@' + slug + '@'
        slug = slug.replace(/\@\-|\-\@|\@/gi, '')
        //In slug ra textbox có id “slug”
        return slug;
    }

    $('#name_slug').keyup(function () {
        var Text = $(this).val();
        Text = convertToSlug(Text);
        $('input[name="slug"]').val(Text);
    });

    $('select[name="group_id"]').change(function () {
        $('input[name="group_name"]').val($(this).find('option:selected').text());
    });

    $('select[name="category_id"]').change(function () {
        $('input[name="category_name"]').val($(this).find('option:selected').text());
    });

    $('select[name="filter_group"]').change(function () {
        var path = window.location.pathname.split('/');
        var linkRedirect = '/' + path[1] + '/' + path[2] + '/filter-group/' + $(this).val();
        window.location.pathname = linkRedirect;
    });

});


var menuLv2 = document.getElementsByClassName("categoryLv2");
var current = document.getElementsByClassName("active");



for (var i = 0; i < menuLv2.length; i++) {
    menuLv2[i].addEventListener("click", function () {
        var parent = document.getElementsByClassName("menu-open");

        parent = parent[0].getElementsByClassName('categoryLv1');
        // var parent = this.closest('.nav-item');
        // console.log(parent);
        if (current.length > 0) {
            // for (let i = 0; i <= current.length; i++) {
            // current[0].classList.remove("active");
            current[1].classList.remove("active");
            // }
            this.className += " active";
            // parent[0].className += " active";
        } else {
            this.className += " active";
            parent[0].className += " active";
        }
        console.log(parent);
    });
}

const alerDelete = (test) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'No, cancel!',
        confirmButtonText: 'Yes, delete it!',
        reverseButtons: true
    }).then((result) => {
        if (result.value) {
            swalWithBootstrapButtons.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            );
            $.ajax({
                type: "GET",
                url: test,
                data: "data",
                dataType: "json",
                success: function (data) {
                    console.log(data);
                }
            });

        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
                'Cancelled',
                'Your imaginary file is safe :)',
                'error'
            )
        }
    })

}

// kiểm tra số lượng đã checked và action lựa chọn
var checkCount = 0;
var textSelect = 'Bulk Action'
$(".custom-control-input").change(function () {
    if($('#check-all:checkbox:checked').length == 0) {
        checkCount = $('input:checkbox:checked').length;
    } else {
        checkCount = $('input:checkbox:checked').length - 1;
    }
    $(".countItems").text(checkCount);;
});

$(".slbAction").change(function () {
    textSelect = $(".slbAction option:selected").text();
});

const applyAction = (link) => {
    console.log(textSelect);
    if (checkCount && textSelect !== 'Bulk Action') {
        $.ajax({
            type: "POST",
            url: link,
            data: "data",
            dataType: "json",
            success: function (response) {
                console.log(response);
            }
        });
    } else {
        Swal.fire({
            toast: true,
            icon: 'error',
            title: 'action unselected or unchecked items',
            animation: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    }

}

const changeOrdering = (element) => {
    const id = element.getAttribute('data-id');
    const link = element.getAttribute('data-link');
    const value = element.value;
    // console.log(element.value);
    $.ajax({
        type: "POST",
        url: link,
        data: { id, value },
        dataType: "json",
        success: function (response) {
            Swal.fire({
                toast: true,
                icon: 'success',
                title: response,
                animation: true,
                position: 'top-right',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    });
}


